import Tile, { TileProps } from './tile'

export const GridRow = (props: { data: TileProps[] }) => {
	return (
		<div className='grid grid-cols-6 gap-0 sm:gap-1'>
			{props.data.map((tile) => (
				<Tile
					key={`${tile.cursor.y}-${tile.cursor.x}-${tile.variant}`}
					variant={tile.variant}
					cursor={tile.cursor}
					image={tile.user?.image}
				>
					{tile.children}
				</Tile>
			))}
		</div>
	)
}

type Props = { data: TileProps[][] }

export default function Grid(props: Props) {
	return (
		<div className='m-auto grid h-min max-w-sm gap-0 sm:gap-1'>
			{props.data.map((row, i) => (
				<div key={`row-${i}`} className='grid grid-cols-6 gap-0 sm:gap-1'>
					{row.map((tile, j) => (
						<Tile
							key={`${tile.cursor.y}-${tile.cursor.x}-${tile.variant}`}
							variant={tile.variant}
							cursor={tile.cursor}
							delay={j * 0.1}
							image={tile.user?.image}
						>
							{tile.children}
						</Tile>
					))}
				</div>
			))}
		</div>
	)
}
