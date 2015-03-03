require_relative '../dev-tools/lib/deployment'

$hipchat_from = 'bodykit'


task :pre_deploy do
  bucket = 'developer.bodylabs.com'
  path = 'examples'

  $s3_publish_source_public = 'build'
  $s3_publish_target_public = "s3://#{bucket}/#{path}/"

  ENV['BASE_URL'] = $base_url = "https://#{bucket}.s3.amazonaws.com/#{path}/"
end

namespace :deploy do

  # right now only one example and please manually create symlink...
  task :pages => [
  'git:require_synced_to_master',
  'pre_deploy',
] do
    BodyLabsDevTools::Deployment.build_and_deploy(
      build_task: Rake::Task['build'],
      deploy_task: Rake::Task['s3_publish:publish'],
      description: 'bodykit-examples',
      clickable_url: '#{$base_url}/measurements/index.html',
    )
  end

end
