require_relative '../dev-tools/lib/deployment'

$hipchat_from = 'bodykit'

$pages_source_public = 'build'
$pages_target_path = 'bodykit-examples'

namespace :deploy do

  task :pre_deploy => [
    'git:require_synced_to_master',
  ]

  # right now only one example and please manually create symlink...
  task :pages => :pre_deploy do
    BodyLabsDevTools::Deployment.build_and_deploy(
      build_task: Rake::Task['build'],
      deploy_task: Rake::Task['pages:publish'],
      description: 'bodykit-examples',
      clickable_url: 'https://bodylabs-pages.s3.amazonaws.com/bodykit-examples/measurements/index.html',
    )
  end

end
