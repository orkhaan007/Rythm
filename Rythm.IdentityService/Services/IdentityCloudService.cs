using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Rythm.IdentityService.Services
{
    public class IdentityCloudService
    {
        private readonly Cloudinary _cloudinary;

        public IdentityCloudService(string cloudName, string apiKey, string apiSecret)
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile image, string folder)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("The image is invalid.");

            using (var stream = image.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(image.FileName, stream),
                    Folder = folder,
                    PublicId = Guid.NewGuid().ToString()
                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.Error != null)
                    throw new Exception($"Cloudinary hatası: {result.Error.Message}");

                return result.SecureUrl.ToString();
            }
        }
    }
}
