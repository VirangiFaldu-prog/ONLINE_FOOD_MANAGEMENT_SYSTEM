using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
    {
        public UserCreateDtoValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Username is required")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters")
                .MaximumLength(100).WithMessage("Username cannot exceed 100 characters");

            RuleFor(x => x.Email)
                
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .MaximumLength(200).WithMessage("Password cannot exceed 200 characters")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number");

            RuleFor(x => x.Phone)
                .Matches(@"^[6-9]\d{9}$")
                .When(x => !string.IsNullOrEmpty(x.Phone))
                .WithMessage("Phone number must be a valid 10-digit Indian number");

            RuleFor(x => x.Role)
                
                .IsInEnum()
                .WithMessage("Invalid user role");
        }
    }
}
