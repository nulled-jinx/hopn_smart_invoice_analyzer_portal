using Microsoft.Extensions.Options;
using SmartInvoiceAnalyzerApi.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class AIService
{
  private readonly HttpClient _httpClient;
  private readonly AISettings _settings;

  public AIService(HttpClient httpClient, IOptions<AISettings> options)
  {
    _httpClient = httpClient;
    _settings = options.Value;
  }

  public async Task<string> ClassifyInvoice(string inputText)
  {
    var requestPayload = new
    {
      contents = new[]
        {
                new
                {
                    parts = new[]
                    {
                        new { text = inputText }
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
