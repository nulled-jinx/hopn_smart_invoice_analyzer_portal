using Microsoft.EntityFrameworkCore;
using SmartInvoiceAnalyzerApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowReactApp",
      builder =>
      {
        builder.WithOrigins("http://localhost:5173")  // Frontend app url
                 .AllowAnyHeader()
                 .AllowAnyMethod();
      });
});

builder.Services.AddControllers();

builder.Services.AddDbContext<InvoiceDbContext>(options =>
    options.UseSqlite("Data Source=invoices.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Local"))
{
  app.UseSwagger();
  app.UseSwaggerUI(c =>
  {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Invoice Analyzer API V1");
    c.RoutePrefix = string.Empty;
  });
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
