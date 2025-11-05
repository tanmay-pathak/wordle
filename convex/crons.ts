import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.cron(
	'Assign Daily Secret Word',
	'0 6 * * *', // Run daily at 6 AM UTC (approx midnight Regina)
	internal.words.assignDailyWord,
	{},
)

crons.cron(
	'Create Daily Game Board',
	'0 6 * * *', // Run daily at 6 AM UTC (approx midnight Regina)
	internal.game.createGame,
	{},
)

crons.cron(
	'Assign Daily Start Time',
	'0 6 * * *', // Run daily at 6 AM UTC (approx midnight Regina)
	internal.game.assignStartTime,
	{},
)

export default crons
