using System.ComponentModel.DataAnnotations;

namespace SmartInvoiceAnalyzerApi.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        public string Role { get; set; }
    }
} 