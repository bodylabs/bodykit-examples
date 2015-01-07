namespace :build do
  desc "Build once, then quit (dev)"
  task :dev do
    Rake::Task['grunt:run'].reenable
    Rake::Task['grunt:run'].invoke 'build'
  end
end

task :build => 'build:dev'