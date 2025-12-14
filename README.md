# ConfigGuard 🛡️

A declarative, type-safe configuration validator with contextual validation and auto-generated documentation for Node.js.

## Installation

```bash
npm install configguard
```

## Quick start

```
import { ConfigGuard } from 'configguard';

const schema = {
  database: {
    host: { type: 'string', required: true },
    port: { type: 'number', default: 5432 }
  }
};

const guard = new ConfigGuard(schema, {
  environment: process.env.NODE_ENV
});

const config = {
  database: {
    host: 'localhost',
    port: 5432
  }
};

const result = await guard.load(config);

if (result.valid) {
  console.log('Configuration is valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Features
✅ Type-safe configuration validation

✅ Contextual validation (different rules per environment)

✅ Auto-generated TypeScript types

✅ Support for multiple config sources

✅ Secret masking for sensitive data

### Documentation

Full documentation available at GitHub repository.


