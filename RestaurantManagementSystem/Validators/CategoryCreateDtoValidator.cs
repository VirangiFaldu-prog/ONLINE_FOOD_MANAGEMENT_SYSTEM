using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class CategoryCreateDtoValidator : AbstractValidator<CategoryCreateDto>
    {
        public CategoryCreateDtoValidator()
        {
            RuleFor(x => x.CategoryName)
                .NotEmpty()
                .WithMessage("Category name is required")
                .MaximumLength(50)
                .WithMessage("Category name cannot exceed 50 characters");
        }
    }
}
