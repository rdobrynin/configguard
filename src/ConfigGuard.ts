

export interface SchemaDefinition {
    [key: string]: any;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ConfigGuardOptions {
    environment?: string;
    strict?: boolean;
}

export class ConfigGuard {
    private schema: SchemaDefinition;
    private options: ConfigGuardOptions;

    constructor(schema: SchemaDefinition, options: ConfigGuardOptions = {}) {
        this.schema = schema;
        this.options = {
            environment: process.env.NODE_ENV || 'development',
            strict: false,
            ...options
        };
    }

    /**
     * Загружает и валидирует конфигурацию
     */
    async load(config: Record<string, any>): Promise<ValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Базовая валидация
            this.validateSchema(config);

            // Контекстная валидация
            if (this.options.environment === 'production') {
                this.validateForProduction(config, warnings);
            }

            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        } catch (error) {
            return {
                valid: false,
                // @ts-ignore
                errors: [`Validation failed: ${error.message}`],
                warnings: []
            };
        }
    }

    /**
     * Генерирует TypeScript типы из схемы
     */
    generateTypes(): string {
        return `// Auto-generated types for ConfigGuard
export interface Config {
  // Add your configuration types here
  [key: string]: any;
}`;
    }

    private validateSchema(config: Record<string, any>): void {
        // Заглушка для валидации
        console.log('Validating schema...');
    }

    private validateForProduction(config: Record<string, any>, warnings: string[]): void {
        // Пример контекстной валидации для production
        if (config.debug === true) {
            warnings.push('Debug mode is enabled in production environment');
        }
    }
}
