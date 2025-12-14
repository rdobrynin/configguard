/**
 * ConfigGuard - TypeScript типы
 * Основные интерфейсы и типы для библиотеки валидации конфигураций
 */

// ==================== ОСНОВНЫЕ ТИПЫ СХЕМЫ ====================

/**
 * Базовый тип для узла схемы
 */
export interface SchemaNode {
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    default?: any;
    description?: string;
    env?: string;
    secret?: boolean;

    // Валидация
    validate?: (value: any, context?: ValidationContext) => boolean | Promise<boolean>;
    pattern?: RegExp;
    enum?: any[];
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;

    // Условные правила
    requiredWhen?: (values: Record<string, any>) => boolean;
    dependsOn?: string[];
    conflictsWith?: string[];

    // Трансформации
    transform?: (value: any) => any;
    coerce?: boolean;

    // Метаданные
    examples?: any[];
    deprecated?: boolean | string;
}

/**
 * Полное определение схемы
 */
export type SchemaDefinition = {
    [key: string]: SchemaNode | SchemaDefinition;
};

/**
 * Скомпилированная схема (внутреннее использование)
 */
export interface CompiledSchema {
    paths: Map<string, CompiledPath>;
    dependencies: DependencyGraph;
    metadata: SchemaMetadata;
}

export interface CompiledPath {
    type: string;
    rules: ValidatorResult[];
    validators: Validator[];
    metadata: PathMetadata;
    defaultValue?: any;
    isSecret: boolean;
    envVar?: string;
    required: boolean;
    path: string;
}

// ==================== РЕЗУЛЬТАТЫ ВАЛИДАЦИИ ====================

/**
 * Результат валидации одного поля
 */
export interface FieldValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    value?: any;
}

/**
 * Полный результат валидации
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    summary: ValidationSummary;
    data?: Record<string, any>;
}

/**
 * Ошибка валидации
 */
export interface ValidationError {
    path: string;
    type: string;
    message: string;
    code: string;
    severity: 'error' | 'fatal';
    details?: Record<string, any>;
    suggestedFix?: string;
    source?: string;
}

/**
 * Предупреждение валидации
 */
export interface ValidationWarning {
    path: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    context?: Record<string, any>;
}

export interface ValidationSummary {
    totalFields: number;
    validatedFields: number;
    errorCount: number;
    warningCount: number;
    durationMs: number;
}

// ==================== ИСТОЧНИКИ ДАННЫХ ====================

/**
 * Определение источника данных
 */
export interface SourceDefinition {
    type: string;
    priority?: number;
    required?: boolean;
    optional?: boolean;
    cache?: boolean;
    ttl?: number;
    [key: string]: any;
}

/**
 * Загруженные сырые данные
 */
export interface RawConfig {
    source: string;
    data: Record<string, any>;
    priority: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

/**
 * Стратегия слияния данных
 */
export type MergeStrategy =
    | 'deep-merge'
    | 'shallow-merge'
    | 'overwrite'
    | 'priority-based'
    | 'custom';

// ==================== ОПЦИИ И КОНТЕКСТ ====================

/**
 * Основные опции ConfigGuard
 */
export interface ConfigGuardOptions {
    // Общие настройки
    environment?: string;
    region?: string;
    stage?: string;

    // Настройки валидации
    validation?: {
        strict?: boolean;
        stopOnFirstError?: boolean;
        unknownFields?: 'error' | 'warning' | 'ignore';
        validateOnLoad?: boolean;
    };

    // Настройки источников
    sources?: {
        mergeStrategy?: MergeStrategy;
        cacheEnabled?: boolean;
        defaultCacheTTL?: number;
        parallelLoading?: boolean;
    };

    // Настройки безопасности
    security?: {
        maskSecrets?: boolean;
        sanitizeInput?: boolean;
        preventPrototypePollution?: boolean;
        allowedProtocols?: string[];
    };

    // Настройки производительности
    performance?: {
        lazyValidation?: boolean;
        compileSchema?: boolean;
        maxRecursionDepth?: number;
    };

    // Настройки логирования
    logging?: {
        level?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
        format?: 'json' | 'text' | 'pretty';
        destination?: 'console' | 'file' | 'stream';
    };

    // Кастомные компоненты
    customValidators?: Validator[];
    customTransformers?: Transformer[];
    customLoaders?: SourceLoader[];

    // Хуки
    hooks?: {
        beforeValidation?: HookCallback[];
        afterValidation?: HookCallback[];
        beforeTransform?: HookCallback[];
        afterTransform?: HookCallback[];
    };
}

/**
 * Контекст валидации
 */
export interface ValidationContext {
    environment: string;
    region?: string;
    stage?: string;
    timestamp: Date;
    user?: {
        id?: string;
        role?: string;
    };
    runtime: {
        nodeVersion: string;
        platform: string;
        memoryUsage: NodeJS.MemoryUsage;
    };
    [key: string]: any;
}

// ==================== ВАЛИДАТОРЫ И ТРАНСФОРМЕРЫ ====================

/**
 * Базовый интерфейс валидатора
 */
export interface Validator {
    name: string;
    validate(
        value: any,
        path: string,
        context: ValidationContext
    ): Promise<ValidatorResult>;
    priority?: number;
}

export interface ValidatorResult {
    valid: boolean;
    type?: string;
    message?: string;
    code?: string;
    fatal?: boolean;
    warning?: string;
    severity?: 'low' | 'medium' | 'high';
    details?: Record<string, any>;
    suggestedFix?: string;
}

/**
 * Базовый интерфейс трансформера
 */
export interface Transformer {
    name: string;
    transform(value: any, context?: TransformContext): any;
    canTransform(value: any): boolean;
}

export interface TransformContext {
    path: string;
    schema: CompiledPath;
    parent?: any;
}

// ==================== ОШИБКИ И ИСКЛЮЧЕНИЯ ====================

/**
 * Базовый класс ошибок ConfigGuard
 */
export class ConfigGuardError extends Error {
    code: string;
    details?: Record<string, any>;

    constructor(
        message: string,
        code: string = 'CONFIG_GUARD_ERROR',
        details?: Record<string, any>
    ) {
        super(message);
        this.name = 'ConfigGuardError';
        this.code = code;
        this.details = details;
    }
}

/**
 * Ошибка валидации
 */
export class ConfigValidationError extends ConfigGuardError {
    errors: ValidationError[];

    constructor(errors: ValidationError[], message?: string) {
        super(
            message || `Configuration validation failed with ${errors.length} error(s)`,
            'VALIDATION_FAILED',
            { errors }
        );
        this.name = 'ConfigValidationError';
        this.errors = errors;
    }

    prettyPrint(): string {
        const lines = [`🔴 Configuration Validation Failed (${this.errors.length} errors)`];

        this.errors.forEach((error, index) => {
            lines.push(`\n${index + 1}. ${error.path} [${error.code}]`);
            lines.push(`   Message: ${error.message}`);

            if (error.details) {
                lines.push(`   Details: ${JSON.stringify(error.details, null, 2)}`);
            }

            if (error.suggestedFix) {
                lines.push(`   Fix: ${error.suggestedFix}`);
            }
        });

        return lines.join('\n');
    }
}

/**
 * Ошибка загрузки источника
 */
export class SourceLoadError extends ConfigGuardError {
    source: string;

    constructor(source: string, originalError: Error) {
        super(
            `Failed to load configuration from source: ${source}`,
            'SOURCE_LOAD_FAILED',
            { originalError: originalError.message }
        );
        this.name = 'SourceLoadError';
        this.source = source;
    }
}

// ==================== УТИЛИТАРНЫЕ ТИПЫ ====================

/**
 * Граф зависимостей полей
 */
export interface DependencyGraph {
    addDependency(from: string, to: string, type: 'requires' | 'conflicts'): void;
    getDependencies(path: string): string[];
    getConflicts(path: string): string[];
    hasCircularDependency(): boolean;
    getTopologicalOrder(): string[];
}

/**
 * Метаданные схемы
 */
export interface SchemaMetadata {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author?: string;
    description?: string;
    tags?: string[];
}

export interface PathMetadata {
    description?: string;
    examples?: any[];
    deprecated?: boolean | string;
    since?: string;
    category?: string;
    stability?: 'experimental' | 'stable' | 'deprecated';
}

/**
 * Хук-колбэк
 */
export type HookCallback = (
    context: HookContext,
    ...args: any[]
) => any | Promise<any>;

export interface HookContext {
    stage: string;
    timestamp: Date;
    data: Record<string, any>;
    logger?: Logger;
}

/**
 * Логгер
 */
export interface Logger {
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}

/**
 * Загрузчик источников
 */
export interface SourceLoader {
    name: string;
    load(options: any): Promise<Record<string, any>>;
    watch?(callback: SourceChangeCallback): () => void;
}

export type SourceChangeCallback = (change: SourceChange) => void;

export interface SourceChange {
    type: 'add' | 'update' | 'delete';
    path: string;
    oldValue?: any;
    newValue?: any;
    timestamp: Date;
}

// ==================== РЕЗУЛЬТАТ ЗАГРУЗКИ ====================

/**
 * Полный результат загрузки конфигурации
 */
export interface ConfigResult<T = any> {
    // Данные
    config: T;
    safeConfig: T; // Без секретов
    rawConfig: Record<string, any>; // Исходные данные

    // Метаданные
    validation: ValidationResult;
    sources: SourceLoadResult[];
    metadata: ConfigMetadata;

    // Утилиты
    get<K extends keyof T>(path: K): T[K];
    set<K extends keyof T>(path: K, value: T[K]): void;
    watch<K extends keyof T>(path: K, callback: WatchCallback<T[K]>): () => void;
}

export interface SourceLoadResult {
    source: string;
    success: boolean;
    duration: number;
    dataCount: number;
    error?: Error;
}

export interface ConfigMetadata {
    loadedAt: Date;
    environment: string;
    schemaVersion: string;
    hash: string;
}

export type WatchCallback<T> = (newValue: T, oldValue: T, path: string) => void;

// ==================== TYPE HELPERS ====================

/**
 * Вспомогательные типы TypeScript
 */

// Получить тип значения по пути в объекте
export type PathValue<T, P extends string> =
    P extends `${infer Key}.${infer Rest}`
        ? Key extends keyof T
            ? PathValue<T[Key], Rest>
            : never
        : P extends keyof T
            ? T[P]
            : never;

// Создать строго типизированную конфигурацию из схемы
export type ConfigFromSchema<S extends SchemaDefinition> = {
    [K in keyof S]: S[K] extends { type: infer T }
        ? T extends 'string'
            ? string
            : T extends 'number'
                ? number
                : T extends 'boolean'
                    ? boolean
                    : T extends 'array'
                        ? S[K] extends { items: infer Item }
                            ? Item extends SchemaDefinition
                                ? ConfigFromSchema<Item>[]
                                : any[]
                            : any[]
                        : T extends 'object'
                            ? S[K] extends SchemaDefinition
                                ? ConfigFromSchema<S[K]>
                                : Record<string, any>
                            : any
        : S[K] extends SchemaDefinition
            ? ConfigFromSchema<S[K]>
            : any;
};

export * from './schema-types';
export * from './validation-types';
export * from './source-types';

