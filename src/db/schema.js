import {
    pgTable,
    serial,
    varchar,
    integer,
    boolean,
    date,
    text,
    timestamp,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 100}).notNull(),
    email: varchar('email', {length: 255}).notNull().unique(),
    passwordHash: varchar('password_hash', {length: 255}).notNull(),
    rolde: roleEnum('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedLocations = pgTable('saved_locations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    label: varchar('label', { length: 50 }).notNull(),
    cityName: varchar('city_name', { length: 100 }).notNull(),
    latitude: varchar('latitude', { length: 20 }).notNull(),
    longitude: varchar('longitude', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});  

export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  locationId: integer('location_id')
    .references(() => savedLocations.id, { onDelete: 'restrict' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const packingItems = pgTable('packing_items', {
  id: serial('id').primaryKey(),
  tripId: integer('trip_id')
    .references(() => trips.id, { onDelete: 'cascade' })
    .notNull(),
  itemName: varchar('item_name', { length: 100 }).notNull(),
  isPacked: boolean('is_packed').default(false).notNull(),
  isSuggested: boolean('is_suggested').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  tripId: integer('trip_id')
    .references(() => trips.id, { onDelete: 'cascade' })
    .notNull(),
  activityName: varchar('activity_name', { length: 150 }).notNull(),
  scheduledDate: timestamp('scheduled_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations (used later for easy nested queries, e.g. "get a trip with its packing items")
export const usersRelations = relations(users, ({ many }) => ({
  savedLocations: many(savedLocations),
  trips: many(trips),
}));

export const savedLocationsRelations = relations(savedLocations, ({ one, many }) => ({
  user: one(users, { fields: [savedLocations.userId], references: [users.id] }),
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  location: one(savedLocations, { fields: [trips.locationId], references: [savedLocations.id] }),
  packingItems: many(packingItems),
  activities: many(activities),
}));

export const packingItemsRelations = relations(packingItems, ({ one }) => ({
  trip: one(trips, { fields: [packingItems.tripId], references: [trips.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  trip: one(trips, { fields: [activities.tripId], references: [trips.id] }),
}));