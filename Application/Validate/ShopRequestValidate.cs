using System.Text.RegularExpressions;
using Queue.Application.DTO.Request;

namespace Queue.Application.Validate;

public static class CreateShopRequestValidator
{
    public static (bool IsValid, List<string> Errors) Verify(CreateShopRequest request)
    {
        var errors = new List<string>();

        ValidateShop(request, errors);
        ValidateBranch(request.Branch, errors);
        ValidateBusinessHours(request.BusinessHours, errors);

        return (!errors.Any(), errors);
    }

    private static void ValidateShop(CreateShopRequest request, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(request.ShopName))
            errors.Add("ShopName is required");
        else if (request.ShopName.Length > 100)
            errors.Add("ShopName must not exceed 100 characters");

        if (string.IsNullOrWhiteSpace(request.ShopType))
            errors.Add("ShopType is required");

        if (request.Branch is null)
            errors.Add("Branch is required");

        if (request.BusinessHours is null || !request.BusinessHours.Any())
            errors.Add("BusinessHours must have at least 1 item");
    }

    private static void ValidateBranch(BranchRequest? branch, List<string> errors)
    {
        if (branch is null) return;

        if (string.IsNullOrWhiteSpace(branch.BranchName))
            errors.Add("BranchName is required");
        else if (branch.BranchName.Length > 100)
            errors.Add("BranchName must not exceed 100 characters");

        if (string.IsNullOrWhiteSpace(branch.BranchPhone))
            errors.Add("BranchPhone is required");
        else if (!IsValidPhone(branch.BranchPhone))
            errors.Add("BranchPhone is not a valid phone number");

        if (branch.BranchAddress is null)
            errors.Add("BranchAddress is required");
        else
            ValidateAddress(branch.BranchAddress, errors);
    }

    private static void ValidateAddress(BranchAddressRequest address, List<string> errors)
    {
        if (address.SubdistrictId <= 0)
            errors.Add("SubdistrictId must be greater than 0");

        if (address.DistrictId <= 0)
            errors.Add("DistrictId must be greater than 0");

        if (address.ProvinceId <= 0)
            errors.Add("ProvinceId must be greater than 0");

        if (string.IsNullOrWhiteSpace(address.Zipcode))
            errors.Add("Zipcode is required");
        else if (!IsValidZipcode(address.Zipcode))
            errors.Add("Zipcode must be 5 digits");
    }

    private static void ValidateBusinessHours(List<BusinessHourRequest> businessHours, List<string> errors)
    {
        if (businessHours is null || !businessHours.Any()) return;

        // ต้องครบ 7 วัน (0-6)
        var days = businessHours.Select(x => x.DayOfWeek).OrderBy(x => x).ToList();
        var expectedDays = Enumerable.Range(0, 7).ToList();
        if (!days.SequenceEqual(expectedDays))
            errors.Add("BusinessHours must contain all 7 days (0=Sunday to 6=Saturday)");

        // เช็ค DayOfWeek ซ้ำ
        var duplicateDays = businessHours
            .GroupBy(x => x.DayOfWeek)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);
        foreach (var day in duplicateDays)
            errors.Add($"DayOfWeek {day} is duplicated");

        foreach (var hour in businessHours)
        {
            var dayLabel = $"DayOfWeek {hour.DayOfWeek}";

            if (hour.DayOfWeek < 0 || hour.DayOfWeek > 6)
            {
                errors.Add($"{dayLabel}: must be between 0 (Sunday) and 6 (Saturday)");
                continue;
            }

            if (!IsValidTimeFormat(hour.OpenTime))
                errors.Add($"{dayLabel}: OpenTime must be in HH:mm format");

            if (!IsValidTimeFormat(hour.CloseTime))
                errors.Add($"{dayLabel}: CloseTime must be in HH:mm format");

            // เช็ค OpenTime < CloseTime เฉพาะวันที่เปิด
            if (hour.IsOpen && IsValidTimeFormat(hour.OpenTime) && IsValidTimeFormat(hour.CloseTime))
            {
                var open = TimeOnly.Parse(hour.OpenTime);
                var close = TimeOnly.Parse(hour.CloseTime);
                if (open >= close)
                    errors.Add($"{dayLabel}: OpenTime must be earlier than CloseTime");
            }
        }
    }

    private static bool IsValidPhone(string phone)
        => Regex.IsMatch(phone, @"^[0-9\+\-\s\(\)]{7,20}$");

    private static bool IsValidZipcode(string zipcode)
        => Regex.IsMatch(zipcode, @"^\d{5}$");

    private static bool IsValidTimeFormat(string time)
        => !string.IsNullOrWhiteSpace(time) &&
           Regex.IsMatch(time, @"^([01]\d|2[0-3]):[0-5]\d$");
}