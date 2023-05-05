import { Component, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import post from "@/utils/post";
import Header from "@/components/Header";
import { getDefaultValues } from "./CreateRoom.utils";
import { useIntl } from "@/i18n";
import OptionsChip from "./components/OptionsChip";
import zod from "zod";

const createRoomSchema = zod.object({
	moderatorName: zod
		.string()
		.min(1, { message: "Must provide a value for name." })
		.max(20, { message: "Name too long. Must be no more than 20 characters." }),
	options: zod.string().array().min(2),
});

const CreateRoom: Component = () => {
	const intl = useIntl();
	const navigate = useNavigate();

	const defaults = getDefaultValues();

	const [error, setError] = createSignal<string | null>(null);
	const [checkedOptions, setCheckedOptions] = createSignal<Array<string>>(
		defaults.options,
	);

	const allOptions: Array<string> = [
		"0.5",
		...Array.from({ length: 15 }, (_, index) => (index + 1).toString()),
		"Yes",
		"No",
		"N/A",
	];

	const handleSubmit = (form: EventTarget & HTMLFormElement): void => {
		const formData = new FormData(form);

		const schemaCheck = createRoomSchema.safeParse({
			moderatorName: formData.get("moderatorName"),
			options: formData.getAll("options"),
		});

		if (!schemaCheck.success) {
			const allErrorMessages = schemaCheck.error.flatten().fieldErrors;

			const singleErrorMessage = Object.entries(allErrorMessages)
				.map(([key, value]) => `${key}: ${value.join("; ")}`)
				.join("\n");

			setError(singleErrorMessage);
			return;
		}

		post("/api/v1/create", { options: schemaCheck.data.options })
			.then((res) => {
				localStorage.setItem(
					"newRoomOptions",
					JSON.stringify(schemaCheck.data.options),
				);
				localStorage.setItem("name", schemaCheck.data.moderatorName);
				navigate(`/room/${res.roomCode}`);
			})
			.catch((err) => setError(err));
	};

	return (
		<>
			<Header />
			<main class="max-w-md m-auto">
				<form
					class="flex flex-col gap-10"
					onInput={(e) => {
						const formData = new FormData(e.currentTarget);
						const checkedOptions = formData.getAll("options") as Array<string>;
						setCheckedOptions(checkedOptions);
					}}
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e.currentTarget);
					}}
				>
					<div class="form-control">
						<label for="moderatorName" class="label-required">
							{intl.t("yourName")}
						</label>
						<input
							autofocus
							id="moderatorName"
							name="moderatorName"
							required
							minLength="1"
							maxLength="20"
							type="text"
							value={defaults.name}
						/>
					</div>

					<fieldset>
						<legend class="label-required">Options</legend>
						<div role="group" class="flex my-2">
							<button
								type="button"
								class="btn-outline btn-sm border-gray rounded-r-none"
								onClick={[setCheckedOptions, ["1", "2", "3", "5", "8", "13"]]}
							>
								Fibonacci
							</button>
							<button
								type="button"
								class="btn-outline btn-sm border-gray rounded-none"
								onClick={[setCheckedOptions, []]}
							>
								Uncheck all
							</button>
							<button
								type="button"
								class="btn-outline btn-sm border-gray rounded-l-none"
								onClick={[setCheckedOptions, allOptions]}
							>
								Check all
							</button>
						</div>
						<div class="flex flex-wrap justify-center gap-2">
							<For each={allOptions}>
								{(option) => (
									<OptionsChip
										value={option}
										checked={checkedOptions().includes(option)}
									/>
								)}
							</For>
						</div>
					</fieldset>

					<Show when={error()} keyed>
						{(errorMsg) => (
							<p class="text-red">
								{intl.t("errorWithMsg", { msg: errorMsg })}
							</p>
						)}
					</Show>

					<button class="btn" type="submit">
						{intl.t("done")}
					</button>
				</form>
			</main>
		</>
	);
};

export default CreateRoom;
