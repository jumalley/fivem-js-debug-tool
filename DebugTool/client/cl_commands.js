RegisterCommand('car', async (source, args, rawCommand) => {
  CarCommand(source, args, rawCommand);
});

RegisterCommand('dv', async (source) => {
  DvCommand();
});

RegisterCommand('debug', async (source, args) => {
  EnableDebug();
});

RegisterCommand('cts', async () => {
  ClearTopSpeed();
});

RegisterCommand('fix', async () => {
  FixCurrentCar();
});

RegisterCommand('clean', async () => {
  CleanCurrentCar();
});

emit('chat:addSuggestion', '/car', 'Spawn vehicle');
emit('chat:addSuggestion', '/dv', 'Delete vehicle');
emit('chat:addSuggestion', '/debug', 'Debug mode');
emit('chat:addSuggestion', '/cts', 'Clear top speed, for car debug');
emit('chat:addSuggestion', '/fix', 'Reapir vehicle');
emit('chat:addSuggestion', '/clean', 'Clean vehicle');
