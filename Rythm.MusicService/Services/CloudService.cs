using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Rythm.Services.CloudService
{
    public class CloudService
    {
        private readonly Cloudinary _cloudinary;

        public CloudService(string cloudName, string apiKey, string apiSecret)
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("The file is invalid.");

            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new RawUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folder,
                    PublicId = Guid.NewGuid().ToString()
                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.Error != null)
                    throw new Exception($"Error: {result.Error.Message}");

                return result.SecureUrl.ToString();
            }
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
                    throw new Exception($"Error: {result.Error.Message}");

                return result.SecureUrl.ToString();
            }
        }
    }
}
