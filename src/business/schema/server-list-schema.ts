import { z } from 'zod'

import { type ServerEntry, type ServerListPayload } from '@/business/model/server-model'

const serverEntrySchema: z.ZodType<ServerEntry> = z.object({
  host: z.string(),
  id: z.string(),
  name: z.string().default(''),
  port: z.number(),
  token: z.string(),
})

export const serverListPayloadSchema: z.ZodType<ServerListPayload> = z.object({
  activeServerId: z.string().optional(),
  servers: z.array(serverEntrySchema),
})
