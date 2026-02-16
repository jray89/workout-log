namespace :admin do
  desc "Grant admin privileges to a user by email"
  task :grant, [ :email ] => :environment do |_t, args|
    email = args[:email]
    abort "Usage: rake admin:grant[user@example.com]" if email.blank?

    user = User.find_by(email: User.normalize_value_for(:email, email))
    abort "Error: No user found with email '#{email}'" unless user

    if user.admin?
      puts "#{user.email} is already an admin."
    else
      user.update!(admin: true)
      puts "Granted admin to #{user.email}."
    end
  end

  desc "Revoke admin privileges from a user by email"
  task :revoke, [ :email ] => :environment do |_t, args|
    email = args[:email]
    abort "Usage: rake admin:revoke[user@example.com]" if email.blank?

    user = User.find_by(email: User.normalize_value_for(:email, email))
    abort "Error: No user found with email '#{email}'" unless user

    if user.admin?
      user.update!(admin: false)
      puts "Revoked admin from #{user.email}."
    else
      puts "#{user.email} is not an admin."
    end
  end
end
