module.exports = {
    // Command Responses
    errorResponse: 'Houve um erro ao executar este comando!',
    noMatchingCommand: (commandName) => `Nenhum comando correspondente a ${commandName} foi encontrado.`,
    permissionUpdated: (userId, allow, selectedCommand) => `O membro <@${userId}> ${allow ? 'agora pode usar' : 'não pode mais usar'} o comando com ID </${selectedCommand.name}:${selectedCommand.id}>.`,
    permissionUpdateError: 'Houve um erro ao atualizar as permissões.',
    pingResponse: (timeTaken) => `Pong! A latência é de ${timeTaken}ms.`,
    permissions: {
        description: 'Gerenciar permissões de comando para membros específicos',
        add: 'Permitir que um membro use um comando',
        remove: 'Remover a permissão de um membro para usar um comando',
        menu (subcommand, member) {
            return `Selecione qual comando você quer ${subcommand === 'add' ? 'permitir' : 'proibir'} para ${member.username}`;
        },
        menuPlaceholder: 'Nenhum comando selecionado',
        menuDescription: 'Comando para definir um membro como VIP',
    },
    ownerOnly: 'Apenas o dono do servidor pode executar este comando.',
    
    // Event Responses
    interactionError: 'Houve um erro ao executar este comando!',
};