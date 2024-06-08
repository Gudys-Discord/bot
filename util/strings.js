/**
 * @typedef {Object} permissions
 * @property {string} description - The command description
 * @property {string} add - The command description for adding permissions
 * @property {string} remove - The command description for removing permissions
 * @property {function (string), {username: string}} menu - The menu text
 * @property {string} menuPlaceholder - The menu placeholder text
 * @property {string} menuDescription - The menu description text
 */

/**
 * @typedef {Object} strings
 * @property {string} errorResponse - The error response text
 * @property {function(string): string} noMatchingCommand - The no matching command text
 * @property {function(string, boolean, {name: string, id: string}): string} permissionUpdated - The permission updated text
 * @property {string} permissionUpdateError - The permission update error text
 * @property {function(number): string} pingResponse - The ping response text
 * @property {permissions} permissions - The permissions object
 * @property {string} ownerOnly - The owner only text
 * @property {string} interactionError - The interaction error text
 */

/** @type {Strings} */

module.exports = {
    // Command Responses
    errorResponse: 'Houve um erro ao executar este comando!',
    noMatchingCommand: (commandName) => `Nenhum comando correspondente a ${commandName} foi encontrado.`,
    permissionUpdated: (userId, allow, selectedCommand) => `O membro <@${userId}> ${allow ? 'agora pode usar' : 'não pode mais usar'} o comando com ID </${selectedCommand.name}:${selectedCommand.id}>.`,
    permissionUpdateError: 'Houve um erro ao atualizar as permissões.',
    pingResponse: (timeTaken) => `Pong! A latência é de ${timeTaken}ms.`,
    ownerOnly: 'Apenas o dono do servidor pode executar este comando.',
    permissions: {
        description: 'Gerenciar permissões de comando para membros específicos',
        add: 'Permitir que um membro use um comando',
        remove: 'Remover a permissão de um membro para usar um comando',
        menu(subcommand, member) {
            return `Selecione qual comando você quer ${subcommand === 'add' ? 'permitir' : 'proibir'} para ${member.username}`;
        },
        menuPlaceholder: 'Nenhum comando selecionado',
        menuDescription: 'Comando para definir um membro como VIP',
    },
    setvip: {
        description: 'Definir um membro como VIP',
        add: 'Definir um membro como VIP',
        remove: 'Remover o VIP de um membro',
        options: {
            member: 'O membro a ser definido como VIP',
            type: 'O VIP a ser atribuído',
        },
        menu: function (subcommand, member) {
            return `Selecione qual VIP você quer ${subcommand === 'add' ? 'atribuir' : 'remover'} para ${member.username}`;
        },
        menuPlaceholder: 'Nenhum VIP selecionado',
        menuDescription: 'VIP para atribuir a um membro',
        vips: {
            yeezyGang: 'YeezyGang',
            rollsRoyce: 'Rolls Royce',
            ghostGang: 'Ghost Gang',
            freestyle: 'Freestyle',
            eightLife: '8life',
            infamous: 'Infamous',
            holyFck: 'HOLY F*CK',
            sexyStar: 'Sexy Star'
        },
    },
    // Event Responses
    interactionError: 'Houve um erro ao executar este comando!',
}