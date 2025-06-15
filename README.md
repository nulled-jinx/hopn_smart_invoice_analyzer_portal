# Smart Invoice Analyzer Portal

A web-based portal built with .NET Core and React that enables users to upload, analyze, and manage invoices using AI capabilities. The system provides intelligent invoice processing, anomaly detection, and classification features.

## Demo

You can check the app image demo in [Images Demo](/ImagesDemo)

## Features Implemented

- **Invoice Upload & Parsing**

  - PDF and image invoice upload
  - AI/OCR extraction of key fields (Vendor, Date, Amount, Tax ID, Due Date, Status)
  - Manual input option when AI/OCR is unavailable

- **AI Integration**

  - Red flag detection for anomalies
  - Invoice classification (To Pay/To Collect)
  - Intelligent field extraction

- **Invoice Management**

  - Comprehensive invoice listing with filtering
  - Detailed invoice view with extracted data
  - Anomaly highlighting and explanations

- **Backend (.NET Core Web API)**

  - Document upload endpoints
  - Invoice operations
  - AI analysis integration
  - SQLite/EF Core InMemory storage

- **Frontend (React)**

  - Modern, responsive UI
  - Upload interface
  - Dashboard with metrics
  - Detailed invoice viewer

- **Additional Features**
  - JWT Authentication
  - PDF export functionality

## Prerequisites

- .NET 8.0 SDK or later
- Node.js 18.x or later
- npm or yarn
- Visual Studio 2022 or VS Code
- SQLite (if using SQLite storage)

## Setup Instructions

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/nulled-jinx/hopn_smart_invoice_analyzer_portal.git
   cd hopn_smart_invoice_analyzer_portal
   ```

2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Restore dependencies:

   ```bash
   dotnet restore
   ```

4. Update the configuration:

   - Open `appsettings.json`
   - Configure your AI service credentials (OpenAI/Azure AI)
   - Set up JWT secret if using authentication

appsettings.json:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "HuggingFace": {
    "ApiKey": "your_api_key",
    "ModelUrl": "model_url"
  },
  "Jwt": {
    "Key": "jwt_secret_key",
    "Issuer": "SmartInvoiceApi",
    "Audience": "SmartInvoiceFrontend",
    "ExpiresInMinutes": 60
  }
}
```

5. Run the backend:
   ```bash
   dotnet run
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. (Optional) Configure environment variables:

   - Create `.env` file

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Usage

1. Access the application at `http://localhost:5173`
2. Log in/Sign up using your credentials
3. Upload invoices through the upload interface
4. View and manage invoices in the dashboard
5. Check detailed AI analysis in the invoice detail view

## Project Structure

```
HopnSmartInvoiceAnalyzer/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   └── Program.cs
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## API Documentation

The API documentation is available at `/swagger` when running the backend server.

## Additional Notes

- Data extraction is handled on the frontend to enhance security, preventing potentially malicious data from reaching the backend.
- Gemini model is used due to running out of credits for other AI services. This model is free to use.
- The AI model can be easily swapped or updated by modifying the configuration in `AIService.cs`
