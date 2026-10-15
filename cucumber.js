export default {
  paths: ['features/**/*.feature'],
  import: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
  format: ['progress-bar', 'html:cucumber-report.html'],
};