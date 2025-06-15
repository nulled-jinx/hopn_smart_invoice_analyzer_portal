using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartInvoiceAnalyzerApi.Migrations
{
    /// <inheritdoc />
    public partial class RenameAiOutputField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AiOuput",
                table: "Invoices",
                newName: "AiOutput");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AiOutput",
                table: "Invoices",
                newName: "AiOuput");
        }
    }
}
