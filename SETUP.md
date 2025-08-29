# Expense Tracker Setup Guide

## OpenAI API Key Configuration

This application uses OpenAI's API for semantic expense categorization and tag extraction. To set up the API key securely:

### For Development (Recommended)

1. **Using User Secrets** (most secure):
   ```bash
   cd ApiService
   dotnet user-secrets set "OpenAI:ApiKey" "your-openai-api-key-here"
   ```

2. **Using Environment Variable**:
   ```bash
   export OpenAI__ApiKey="your-openai-api-key-here"
   ```

3. **Using appsettings.Development.json** (not recommended for production):
   ```json
   {
     "OpenAI": {
       "ApiKey": "your-openai-api-key-here"
     }
   }
   ```

### For Production

Use environment variables or Azure Key Vault:
```bash
export OpenAI__ApiKey="your-openai-api-key-here"
```

### Getting Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (starts with `sk-proj-` or `sk-`)
4. Configure it using one of the methods above

### Features

- **Hybrid Categorization**: Uses rule-based matching first, then falls back to AI for unknown expenses
- **Smart Tag Extraction**: AI extracts contextual tags from expense descriptions
- **Cost Optimization**: Only calls AI when needed, with input truncation to control costs
- **Graceful Degradation**: Application works without API key (rule-based mode only)

### Running the Application

```bash
# Start the full application (API + Web)
dotnet run --project AppHost

# Or start just the API
dotnet run --project ApiService
```

The application will automatically use semantic categorization if an API key is configured, otherwise it will fall back to rule-based categorization.