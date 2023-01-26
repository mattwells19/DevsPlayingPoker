import { Component, createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-app-router";
import RangeSlider from "./components/RangeSlider";
import post from "@/utils/post";
import Header from "@/components/Header";
import {
	getOptions,
	getFormValues,
	getDefaultValues,
	availableOptions,
	defaultRangeSelect,
} from "./CreateRoom.utils";
import {
	nameSchema,
	optionsSchemaMap,
	CreateRoomFields,
} from "./CreateRoom.schemas";
import { useIntl } from "@/i18n";

const CreateRoom: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();

	const defaults = getDefaultValues();

	const [error, setError] = createSignal<string | null>(null);
	const [list, setList] = createSignal<string>(defaults.list);
	const [optionsSelect, setOptionsSelect] = createSignal<
		CreateRoomFields["voterOptions"]
	>(defaults.formValues.voterOptions);

	let formRef: HTMLFormElement;

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = getFormValues(form);

		const schemaCheck = optionsSchemaMap[formData.voterOptions]
			.extend(nameSchema)
			.safeParse(formData);

		if (!schemaCheck.success) {
			const allErrorMessages = schemaCheck.error.flatten().fieldErrors;

			const singleErrorMessage = Object.entries(allErrorMessages)
				.map(([key, value]) => `${key}: ${value.join("; ")}`)
				.join("\n");

			setError(singleErrorMessage);
			return;
		}

		const options = getOptions(formData.voterOptions, formData.numberOfOptions);

		if (formData.noVote) {
			options.unshift("N/A");
		}

		post("/api/v1/create", { options })
			.then((res) => {
				localStorage.setItem("newRoomFields", JSON.stringify(formData));
				localStorage.setItem("name", formData.moderatorName);
				navigate(`/room/${res.roomCode}`);
			})
			.catch((err) => setError(err));
	};

	const handleChange = (form: EventTarget & HTMLFormElement) => {
		const formData = getFormValues(form);
		setError(null);

		if (optionsSelect() !== formData.voterOptions) {
			// allow the effect to set the values since elements may need to be mounted
			setOptionsSelect(formData.voterOptions);
			return;
		}

		const options = getOptions(optionsSelect(), formData.numberOfOptions);

		if (formData.noVote) {
			options.push("🚫");
		}

		setList(options.join(", "));
	};

	createEffect(() => {
		const formData = getFormValues(formRef);

		const options = getOptions(optionsSelect(), formData.numberOfOptions);

		if (formData.noVote) {
			options.push("🚫");
		}

		setList(options.join(", "));
	});

	return (
		<>
			<Header />
			<main class="max-w-md m-auto">
				<form
					class="flex flex-col gap-4"
					ref={(el) => (formRef = el)}
					onInput={(e) => handleChange(e.currentTarget)}
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e.currentTarget);
					}}
				>
					<div class="form-control">
						<label for="moderatorName" class="label justify-start">
							{intl.t("yourName")}
							<span class="text-error ml-1">*</span>
						</label>
						<input
							autofocus
							id="moderatorName"
							name="moderatorName"
							required
							minLength="1"
							maxLength="10"
							type="text"
							value={defaults.name}
							class="input input-bordered"
						/>
					</div>

					<div class="divider" />

					<div class="form-control">
						<label for="voterOptions" class="label justify-start">
							{intl.t("voterOptions")}
							<span class="text-error ml-1">*</span>
						</label>
						<select
							id="voterOptions"
							name="voterOptions"
							required
							value={defaults.formValues.voterOptions}
							class="select select-bordered"
						>
							<option value="fibonacci">{intl.t("fibonacci")}</option>
							<option value="linear">{intl.t("linear")}</option>
							<option value="yesNo">{intl.t("yesNo")}</option>
						</select>
					</div>

					<Show when={optionsSelect() !== "yesNo"}>
						<RangeSlider
							id="numberOfOptions"
							name="numberOfOptions"
							label={intl.t("numberOfOptions", {
								min: availableOptions[optionsSelect()][0],
								max: availableOptions[optionsSelect()].slice(-1),
							})}
							min={0}
							max={14}
							step={1}
							value={defaults.formValues.numberOfOptions ?? defaultRangeSelect}
						/>

						<fieldset class="form-control">
							<legend class="label">{intl.t("includeNoVote")}</legend>

							<label class="label cursor-pointer flex items-center justify-start gap-2 pl-3">
								<input
									type="radio"
									name="noVote"
									value="yes"
									checked={defaults.formValues.noVote}
									class="radio radio-sm radio-secondary dark:radio-accent"
								/>
								{intl.t("yes")}
							</label>

							<label class="label cursor-pointer flex items-center justify-start gap-2 pl-3">
								<input
									type="radio"
									name="noVote"
									value="no"
									checked={!defaults.formValues.noVote}
									class="radio radio-sm radio-secondary dark:radio-accent"
								/>
								{intl.t("no")}
							</label>
						</fieldset>
					</Show>

					<dl class="form-control">
						<dt class="label">{intl.t("finalPreview")}</dt>
						<dd class="pl-3">{list}</dd>
					</dl>

					<div class="divider after:display-none" />

					<Show when={error()} keyed>
						{(errorMsg) => (
							<p class="text-error">
								{intl.t("errorWithMsg", { msg: errorMsg })}
							</p>
						)}
					</Show>

					<button class="btn btn-primary" type="submit">
						{intl.t("done")}
					</button>
				</form>
			</main>
		</>
	);
};

export default CreateRoom;
