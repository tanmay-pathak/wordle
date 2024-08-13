import { useCallback, useEffect } from "react";
import { match } from "ts-pattern";
import { always, propEq } from "ramda";

import { Delete } from "lucide-react";
import { GameTile } from "@/lib/types";

export const MAPPABLE_KEYS = {
	backspace: <Delete />,
	enter: "ENTER",
} as const;

export type MappableKeys = keyof typeof MAPPABLE_KEYS;

export function isMappableKey(key: string): key is MappableKeys {
	return key in MAPPABLE_KEYS;
}

const KEYS = [
	["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
	["", "A", "S", "D", "F", "G", "H", "J", "K", "L", ""],
	["enter", "Z", "X", "C", "V", "B", "N", "M", "backspace"],
];

export const VALID_KEYS = KEYS.flatMap((row) =>
	row.map((key) => key.toLowerCase()),
).filter(Boolean);

function isValidKey(key: string) {
	return VALID_KEYS.includes(key);
}

type Props = {
	onKeyPress: (key: string) => void;
	disabled?: boolean;
	usedKeys: Record<string, GameTile[]>;
};

export default function Keyboard({ onKeyPress, disabled, usedKeys }: Props) {
	useEffect(() => {
		function onKeyUp(e: KeyboardEvent) {
			if (isValidKey(e.key.toLowerCase())) {
				onKeyPress(e.key.toLowerCase());
			}
		}

		document.addEventListener("keyup", onKeyUp);

		return () => {
			document.removeEventListener("keyup", onKeyUp);
		};
	}, [onKeyPress]);

	function propEqLoose(propName: string, value: any) {
		return (obj: any) => obj[propName] == value;
	}

	const getKeyColors = useCallback(
		(key: string) => {
			if (key in usedKeys) {
				const tiles = usedKeys[key];

				const tile =
					tiles.find(propEqLoose("variant", "correct")) ??
					tiles.find(propEqLoose("variant", "present")) ??
					tiles.find(propEqLoose("variant", "absent"));

				return {
					color: tile?.variant ? "white" : "black",
					background: match(tile?.variant ?? "empty")
						.with("absent", always("rgb(75 85 99)"))
						.with("correct", always("rgb(34 197 94)"))
						.with("present", always("rgb(234 179 8)"))
						.otherwise(always("")),
				};
			}

			return {};
		},
		[usedKeys],
	);

	return (
		<div className="mx-auto grid h-min select-none gap-4">
			{KEYS.map((row, i) => (
				<div
					className="flex touch-manipulation justify-evenly gap-1 md:gap-2"
					key={`row-${i}`}
				>
					{row.map((key, j) =>
						key === "" ? (
							<div key={`empty-${j}`} className="w-2" />
						) : (
							<button
								className="relative h-12 sm:h-16 bg-gray-300 hover:bg-gray-400 active:opacity-60 md:p-3 p-2 rounded-md md:text-xl sm:text-sm text-xs font-bold transition-all md:min-w-[2.5rem] min-w-[1.85rem]"
								disabled={disabled}
								key={key}
								onClick={onKeyPress.bind(null, key.toLowerCase())}
								style={
									disabled ? { opacity: 0.5 } : getKeyColors(key.toLowerCase())
								}
							>
								{isMappableKey(key) ? MAPPABLE_KEYS[key] : key}
							</button>
						),
					)}
				</div>
			))}
		</div>
	);
}
