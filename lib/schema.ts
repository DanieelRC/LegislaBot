import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Definimos un ENUM para el campo status en bills
export const billStatusEnum = pgEnum("bill_status", [
  "draft",
  "published",
  "archived",
])

// Tabla de proyectos de ley
export const billsTable = pgTable("bills", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  status: billStatusEnum("status").notNull().default("draft"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// Tabla de borradores
export const draftsTable = pgTable("drafts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  bill_id: integer("bill_id")
    .references(() => billsTable.id, { onDelete: "set null" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// Tabla de ejemplos
export const examplesTable = pgTable("examples", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// Tabla de configuraciones
export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// Tabla para seguimiento de uso de API
export const apiUsageTable = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  api_name: varchar("api_name", { length: 100 }).notNull(),
  tokens_used: integer("tokens_used").notNull(),
  cost_estimate: decimal("cost_estimate", { precision: 10, scale: 6 }).default("0"),
  request_type: varchar("request_type", { length: 50 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// Relaciones entre tablas
export const billsRelations = relations(billsTable, ({ many }) => ({
  drafts: many(draftsTable),
}))

export const draftsRelations = relations(draftsTable, ({ one }) => ({
  bill: one(billsTable, {
    fields: [draftsTable.bill_id],
    references: [billsTable.id],
  }),
}))