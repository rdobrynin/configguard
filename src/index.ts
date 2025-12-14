// Реэкспорт основного класса
export { ConfigGuard } from './ConfigGuard';

// Реэкспорт всех типов
export * from './types';

// Реэкспорт ошибок
export {
    ConfigGuardError,
    ConfigValidationError,
    SourceLoadError
} from './types';

// Реэкспорт SchemaBuilder
export {
    SchemaBuilder,
    createSchemaBuilder,
    StringSchemaBuilder,
    NumberSchemaBuilder,
    BooleanSchemaBuilder
} from './SchemaBuilder';

// Экспорт по умолчанию
import { ConfigGuard } from './ConfigGuard';
export default ConfigGuard;
