import type { UserShortcuts } from "unocss";
import type { Theme } from "./theme";

const shortcuts: UserShortcuts<Theme> = {
	input:
		"bg-inherit border border-solid border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2",
	"btn-base":
		"flex items-center justify-center rounded-lg font-medium px-4 py-3 uppercase transition-colors",
	btn: "btn-base bg-brand-orange hover:bg-brand-orange-darker active:bg-brand-orange-lighter text-black",
	"btn-ghost":
		"btn-base bg-transparent text-inherit hover:(bg-brand-navy bg-opacity-10) dark:hover:(bg-brand-whitish bg-opacity-10)",
	"btn-outline": "btn-ghost border border-current",
	"btn-sm": "text-sm px-2 py-1.5",
	select: "input px-3 py-2 [&>option]:(bg-brand-whitish dark:bg-brand-navy)",
	radio:
		"appearance-none cursor-pointer rounded-full w-4 h-4 border border-brand-reddish dark:border-brand-turquoise checked:(radio-inset-brand-whitish bg-brand-reddish dark:bg-brand-turquoise dark:radio-inset-brand-navy)",
	"btn-icon":
		"p-3 bg-transparent rounded-lg transition-colors hover:(bg-brand-navy bg-opacity-10) dark:hover:(bg-brand-whitish bg-opacity-10)",
	"form-control": "flex flex-col gap-1",
	"label-required":
		"after:(content-['*'] text-brand-reddish dark:text-red ml-1)",
	"border-color": "border-gray-300 dark:border-slate-600",
	modal:
		"fixed m-auto backdrop:bg-black/40 bg-brand-whitish dark:(bg-brand-navy) py-4 px-6 rounded-md w-full max-w-md",
	"modal-opening":
		"animate-[pop-in_150ms_ease-in-out] backdrop:animate-[fade-in_150ms_ease-in-out]",
	"modal-closing":
		"animate-[pop-in_150ms_ease-in-out_reverse] backdrop:animate-[fade-in_150ms_ease-in-out_reverse]",
	drawer:
		"fixed right-0 ml-auto w-xs h-screen p-4 backdrop:bg-black/40 bg-brand-whitish dark:bg-brand-navy max-h-none",
	"drawer-opening":
		"animate-[slide-in_150ms_ease-in-out] backdrop:animate-[fade-in_150ms_ease-in-out]",
	"drawer-closing":
		"animate-[slide-in_150ms_ease-in-out_reverse] backdrop:animate-[fade-in_150ms_ease-in-out_reverse]",
};

export default shortcuts;
