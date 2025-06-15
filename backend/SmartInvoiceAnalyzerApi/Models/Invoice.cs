namespace SmartInvoiceAnalyzerApi.Models
{
  public class Invoice
  {
    public int Id { get; set; }
    public string? Vendor { get; set; }
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string? TaxId { get; set; }
    public DateTime DueDate { get; set; }
    public string? Status { get; set; }
    public string? InvoiceType { get; set; }
    public string? Anomalies { get; set; }

    public string? AiOutput { get; set; }
  }
}
