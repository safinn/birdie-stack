import type {
  ColumnBaseConfig,
  ColumnBuilderBaseConfig,
  MakeColumnConfig,
} from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type {
  AnyPgTable,
  PgUUIDBuilderHKT,
  PgUUIDBuilderInitial,
  PgUUIDHKT,
} from 'drizzle-orm/pg-core'
import { PgColumn } from 'drizzle-orm/pg-core'
import { PgColumnBuilder } from 'drizzle-orm/pg-core'

export class PgUUIDV7Builder<
  T extends ColumnBuilderBaseConfig
> extends PgColumnBuilder<PgUUIDBuilderHKT, T> {
  /**
   * Adds `default uuid7()` to the column definition.
   */
  defaultRandom(): ReturnType<this['default']> {
    return this.default(sql`uuid7()`) as ReturnType<this['default']>
  }

  build<TTableName extends string>(
    table: AnyPgTable<{ name: TTableName }>
  ): PgUUIDV7<MakeColumnConfig<T, TTableName>> {
    return new PgUUIDV7<MakeColumnConfig<T, TTableName>>(table, this.config)
  }
}

export class PgUUIDV7<T extends ColumnBaseConfig> extends PgColumn<
  PgUUIDHKT,
  T
> {
  getSQLType(): string {
    return 'uuid'
  }
}

export function uuidv7<TName extends string>(
  name: TName
): PgUUIDBuilderInitial<TName> {
  return new PgUUIDV7Builder(name)
}
