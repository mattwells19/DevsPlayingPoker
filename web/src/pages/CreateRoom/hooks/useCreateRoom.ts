import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-app-router";

import post from "../../../services/post";

type CreateRoomFields = {
	moderatorName: string;
	selectedOptions: Number[];
	voterOptions: Number[];
	numberOfOptions: Number;
	error: string | null;
	disabled: boolean;
};

const defaultStoreData = {
	moderatorName: "",
	selectedOptions: [],
	voterOptions: [],
	numberOfOptions: 5,
	error: null,
	disabled: true,
};

const options = {
	fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
	linear: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
	select: [],
};

const useCreateRoom = () => {
	const [fields, setFields] = createStore<CreateRoomFields>(defaultStoreData);
	const navigate = useNavigate();

	const updateField = (event: Event) => {
		const { name, value } = event.currentTarget as HTMLInputElement;

		switch (name) {
			case "moderatorName":
				setFields({ moderatorName: value });
				break;
			case "voterOptions": {
				const currentOptions = options[value];
				const limitedOptions = currentOptions.slice(0, fields.numberOfOptions);

				setFields({
					voterOptions: value,
					selectedOptions: limitedOptions,
					disabled: false,
				});
				break;
			}
			case "numberOfOptions": {
				const currentVoterOptions = options[fields.voterOptions];
				const limitedOptions = currentVoterOptions.slice(0, value);

				setFields({
					numberOfOptions: value,
					selectedOptions: limitedOptions,
				});
				break;
			}
			case "noVote": {
				if (value === "yes") {
					setFields({
						selectedOptions: [0, ...fields.selectedOptions],
					});
					break;
				}

				if (value === "no" && fields.selectedOptions[0] === 0) {
					setFields({
						selectedOptions: fields.selectedOptions.slice(1),
					});
					break;
				}

				break;
			}
			case "select":
				setFields({ selectedOptions: [], disabledFields: true });
				break;
			default:
				break;
		}
	};

	const submit = async () => {
		try {
			const postBody = {
				moderatorName: fields.moderatorName,
				options: fields.selectedOptions,
			};

			const response = await post("/api/v1/create", postBody);
			navigate(`/room/${response.roomCode}`);
		} catch (err) {
			setFields({ error: err });
		}
	};

	return { fields, submit, updateField };
};

export default useCreateRoom;
