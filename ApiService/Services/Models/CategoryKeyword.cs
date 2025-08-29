namespace ApiService.Services.Models;

public record CategoryKeyword(
    string Keyword, 
    double Weight, 
    CategoryKeywordType Type = CategoryKeywordType.Exact);

public enum CategoryKeywordType
{
    Exact,
    Contains,
    StartsWith,
    EndsWith
}