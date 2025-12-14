import { SchemaDefinition, SchemaNode } from './types';

/**
 * Флюентный API для создания схем конфигурации
 */
export class SchemaBuilder {
    private schema: SchemaDefinition = {};

    constructor(private parent?: SchemaBuilder, private parentKey?: string) {}

    /**
     * Создает строковое поле
     */
    string(key: string): StringSchemaBuilder {
        return new StringSchemaBuilder(this, key);
    }

    /**
     * Создает числовое поле
     */
    number(key: string): NumberSchemaBuilder {
        return new NumberSchemaBuilder(this, key);
    }

    /**
     * Создает булево поле
     */
    boolean(key: string): BooleanSchemaBuilder {
        return new BooleanSchemaBuilder(this, key);
    }

    /**
     * Создает объект
     */
    object(key: string, definition: (builder: SchemaBuilder) => void): this {
        const nestedBuilder = new SchemaBuilder(this, key);
        definition(nestedBuilder);

        if (this.parent && this.parentKey) {
            // Если есть родитель, добавляем к нему
            this.parent.addToSchema(this.parentKey, nestedBuilder.build());
        } else {
            // Иначе добавляем в корень
            this.schema[key] = nestedBuilder.build();
        }

        return this;
    }

    /**
     * Создает массив
     */
    array(key: string, itemSchema: SchemaNode): this {
        const schema: SchemaNode = {
            type: 'array',
            // @ts-ignore
            items: itemSchema
        };

        if (this.parent && this.parentKey) {
            this.parent.addToSchema(this.parentKey, { [key]: schema });
        } else {
            this.schema[key] = schema;
        }

        return this;
    }

    /**
     * Добавляет поле в схему
     */
    addToSchema(key: string, value: SchemaNode | SchemaDefinition): void {
        this.schema[key] = value;
    }

    /**
     * Возвращает построенную схему
     */
    build(): SchemaDefinition {
        if (this.parent && this.parentKey) {
            // Возвращаем только часть схемы для вложенных объектов
            const result: SchemaDefinition = {};
            result[this.parentKey] = this.schema;
            return result;
        }
        return this.schema;
    }
}

/**
 * Билдер для строковых полей
 */
export class StringSchemaBuilder {
    private node: SchemaNode = { type: 'string' };

    constructor(
        private parent: SchemaBuilder,
        private key: string
    ) {}

    required(): this {
        this.node.required = true;
        return this;
    }

    default(value: string): this {
        this.node.default = value;
        return this;
    }

    env(variableName: string): this {
        this.node.env = variableName;
        return this;
    }

    description(text: string): this {
        this.node.description = text;
        return this;
    }

    pattern(regex: RegExp): this {
        this.node.pattern = regex;
        return this;
    }

    enum(values: string[]): this {
        this.node.enum = values;
        return this;
    }

    minLength(length: number): this {
        this.node.minLength = length;
        return this;
    }

    maxLength(length: number): this {
        this.node.maxLength = length;
        return this;
    }

    secret(): this {
        this.node.secret = true;
        return this;
    }

    /**
     * Завершает определение поля и возвращает родительский билдер
     */
    end(): SchemaBuilder {
        this.parent.addToSchema(this.key, this.node);
        return this.parent;
    }

    /**
     * Быстрый доступ к созданной схеме
     */
    build(): SchemaDefinition {
        this.end();
        return this.parent.build();
    }
}

/**
 * Билдер для числовых полей
 */
export class NumberSchemaBuilder {
    private node: SchemaNode = { type: 'number' };

    constructor(
        private parent: SchemaBuilder,
        private key: string
    ) {}

    required(): this {
        this.node.required = true;
        return this;
    }

    default(value: number): this {
        this.node.default = value;
        return this;
    }

    env(variableName: string): this {
        this.node.env = variableName;
        return this;
    }

    description(text: string): this {
        this.node.description = text;
        return this;
    }

    min(value: number): this {
        this.node.min = value;
        return this;
    }

    max(value: number): this {
        this.node.max = value;
        return this;
    }

    integer(): this {
        this.node.validate = (value: any) => Number.isInteger(value);
        return this;
    }

    positive(): this {
        this.node.validate = (value: any) => value > 0;
        return this;
    }

    end(): SchemaBuilder {
        this.parent.addToSchema(this.key, this.node);
        return this.parent;
    }

    build(): SchemaDefinition {
        this.end();
        return this.parent.build();
    }
}

/**
 * Билдер для булевых полей
 */
export class BooleanSchemaBuilder {
    private node: SchemaNode = { type: 'boolean' };

    constructor(
        private parent: SchemaBuilder,
        private key: string
    ) {}

    required(): this {
        this.node.required = true;
        return this;
    }

    default(value: boolean): this {
        this.node.default = value;
        return this;
    }

    env(variableName: string): this {
        this.node.env = variableName;
        return this;
    }

    description(text: string): this {
        this.node.description = text;
        return this;
    }

    coerce(): this {
        this.node.coerce = true;
        return this;
    }

    end(): SchemaBuilder {
        this.parent.addToSchema(this.key, this.node);
        return this.parent;
    }

    build(): SchemaDefinition {
        this.end();
        return this.parent.build();
    }
}

/**
 * Вспомогательная функция для создания билдера
 */
export function createSchemaBuilder(): SchemaBuilder {
    return new SchemaBuilder();
}

/**
 * Пример использования:
 *
 * const schema = createSchemaBuilder()
 *   .string('database.host')
 *     .required()
 *     .env('DB_HOST')
 *     .description('Database host')
 *     .default('localhost')
 *   .number('database.port')
 *     .min(1).max(65535)
 *     .default(5432)
 *   .object('features', (builder) => {
 *     builder
 *       .boolean('cache.enabled').default(true)
 *       .number('cache.ttl').min(0)
 *   })
 *   .build();
 */
