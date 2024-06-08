/**
 * @typedef {Object} permissions
 * @property {string} description - The command description
 * @property {string} add - The command description for adding permissions
 * @property {string} remove - The command description for removing permissions
 * @property {function (string), {username: string}} menu - The menu text
 * @property {string} menuPlaceholder - The menu placeholder text
 * @property {string} menuDescription - The menu description text
 * @property {Object} ownerID - The owner ID object
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
 * @property {string} interactionReply - The interaction reply text
 * @property {Object} interactionCreate - The interaction create object
 * @property {function(string): string} interactionCreate.noCommand - The interaction create no command text
 * @property {string} interactionCreate.commandFollowUpError - The interaction create command follow up error text
 * @property {string} interactionCreate.commandFollowUpReply - The interaction create command follow up reply text
 * @property {Object} interactionCreate.subMenu - The interaction create sub menu object
 * @property {function(number, boolean): string} interactionCreate.subMenu.success - The interaction create sub menu success text
 * @property {string} interactionCreate.subMenu.error - The interaction create sub menu error text
 * @property {Object} guildMemberUpdate - The guild member update object
 * @property {function(string, string): string} guildMemberUpdate.removedRole - The guild member update removed role text
 * @property {string} guildMemberUpdate.errorCheckingVipStatus - The guild member update error checking VIP status text
 * @property {Object} setvip - The set VIP object
 * @property {string} setvip.description - The set VIP description text
 * @property {string} setvip.add - The set VIP add text
 * @property {string} setvip.remove - The set VIP remove text
 * @property {Object} setvip.options - The set VIP options object
 * @property {string} setvip.options.member - The set VIP options member text
 * @property {string} setvip.options.type - The set VIP options type text
 * @property {function(string, {username: string}): string} setvip.menu - The set VIP menu text
 * @property {string} setvip.menuPlaceholder - The set VIP menu placeholder text
 * @property {string} setvip.menuDescription - The set VIP menu description text
 * @property {Object} setvip.vips - This object contains the VIP roles' names
 */

/** @type {strings} */

module.exports = {
    // Interal Strings
    main: {
        warning: (filePath) => `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        logged: (tag) => `Logged in as ${tag}!`,
    },
    ownerID: '440442804360052736',
    // Command Responses
    errorResponse: 'Houve um erro ao executar este comando!',
    noPermission: 'Você não tem permissão para executar este comando.',
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
        invalidDays: 'Você deve inserir um número válido de dias.',
        changeExpirySuccess: 'O tempo de expiração do VIP foi alterado com sucesso.',
        changeExpiryError: 'Houve um erro ao alterar o tempo de expiração do VIP.',
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
        success: (username, roleName) => `O membro ${username} recebeu o VIP ${roleName} por 30 dias!`,
        noVip: 'O membro não é um VIP.',
        removeSuccess: `O membro não é mais um VIP.`,
        removeError: 'Houve um erro ao remover o VIP.',
        changeExpiration: (time) => `O tempo de expiração do VIP foi alterado para ${time}.`
    },    // Event Responses
    interactionCreate: {
        noCommand: (commandName) => `No command matching ${commandName} was found.`,
        commandFollowUpError: 'Houve um erro ao executar este comando.',
        commandFollowUpReply: 'Houve um erro ao executar este comando.',
        subMenu: {
            permissions: {
                success: (userId, allow) => `O membro <@${userId}> ${allow ? 'agora pode usar' : 'não pode mais usar'} o comando.`,
                error: 'Houve um erro ao atualizar as permissões.'
            }
        }
    },
    guildMemberUpdate: {
        removedRole: (member, role) => `VIP: Removed VIP role ${role} from ${member.user.tag} because they are not a VIP member in the database.`,
        errorCheckingVipStatus: 'VIP: Error checking VIP status:'
    }
}