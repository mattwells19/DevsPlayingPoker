import { Component, JSX, splitProps } from "solid-js";

type IconName =
	| "settings-cog" // not used
	| "no-vote"
	| "save"
	| "caret-down"
	| "refresh" // not used
	| "github"
	| "ellipsis-vertical" // not used
	| "user-solid"
	| "pencil" // not used
	| "arrows-right-left";

interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	name: IconName;
	"aria-label": string;
	boxSize?: JSX.SvgSVGAttributes<SVGSVGElement>["width"];
}

const Icon: Component<IconProps> = (props) => {
	const [customProps, svgProps] = splitProps(props, ["name", "boxSize"]);

	return (
		<svg width={customProps.boxSize} height={customProps.boxSize} {...svgProps}>
			<use href={`/icons/sprite.svg#${customProps.name}`}></use>
		</svg>
	);
};

export default Icon;
