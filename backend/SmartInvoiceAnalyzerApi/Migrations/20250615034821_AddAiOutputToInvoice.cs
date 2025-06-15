using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartInvoiceAnalyzerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAiOutputToInvoice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiOuput",
                table: "Invoices",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiOuput",
                table: "Invoices");
        }
    }
}
