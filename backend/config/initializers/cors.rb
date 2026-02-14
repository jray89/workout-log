Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In production, set ALLOWED_ORIGINS environment variable to your domain
    # Example: ALLOWED_ORIGINS=https://yourdomain.com
    # For multiple origins: ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
    origins ENV.fetch("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: [ "Authorization" ]
  end
end
