class FallbackController < ActionController::API
  def index
    file = Rails.root.join("public", "index.html")
    render file: file, layout: false, content_type: "text/html"
  end
end
