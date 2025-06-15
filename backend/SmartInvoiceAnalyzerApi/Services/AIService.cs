using Microsoft.Extensions.Options;
using SmartInvoiceAnalyzerApi.Models;
using System.Text;
using System.Text.Json;

public class AIService
{
  private readonly HttpClient _httpClient;
  private readonly AISettings _settings;

  public AIService(HttpClient httpClient, IOptions<AISettings> options)
  {
    _httpClient = httpClient;
    _settings = options.Value;
  }

  public async Task<string> ClassifyInvoice(
  string? vendor,
  decimal? amount,
  string? taxId,
  DateTime? dueDate,
  DateTime? invoiceDate,
  string? status)
  {
    string prompt = $@"
Analyze this invoice:

Vendor: {vendor ?? "N/A"}
Amount: {amount}
Tax ID: {taxId ?? "N/A"}
Due Date: {dueDate:yyyy-MM-dd}
Invoice Date: {invoiceDate:yyyy-MM-dd}
Status: {status ?? "N/A"}

Please:
1. Identify potential red flags (e.g., missing fields, unusual values, ...).
2. Classify if the invoice is 'To Pay' or 'To Collect'.

Respond ONLY in JSON format as:

{{
  ""redFlags"": [""Missing Vendor"", ""Amount is zero or negative"", or any other anomaly],
  ""classification"": [""To Pay"", ""To Collect""],
  ""aioutput"": Here you return your analysis of the invoice as a string
}}";

    var requestPayload = new
    {
      contents = new[]
      {
      new
      {
        parts = new[]
        {
          new { text = prompt }
        }
      }
    }
    };

    var json = JsonSerializer.Serialize(requestPayload);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var url = $"{_settings.ModelUrl}:generateContent?key={_settings.ApiKey}";

    var request = new HttpRequestMessage(HttpMethod.Post, url);
    request.Content = content;

    var response = await _httpClient.SendAsync(request);
    var responseString = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
    {
      throw new Exception($"Gemini API error: {response.StatusCode}\n{responseString}");
    }

    return responseString;
  }
}
