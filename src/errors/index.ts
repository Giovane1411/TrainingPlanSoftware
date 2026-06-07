// Esse arquivo define os "tipos de erro" que o nosso sistema pode lançar.
// Em vez de usar o erro genérico do JavaScriptm, criamos erros com NOMES específicos.
// Por que ? Para que quando algo der errado, a gente saiba EXATAMENTE o que aconteceu
export class NotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = "NotFoundError";
    }        
}

// Esse erro é lançado quando o plano de treino existe, mas não está ativo (por exemplo, o usuário desativou o plano) 
export class WorkoutPlanNotActiveError extends Error{
    constructor(message: string){
        super(message);
        this.name = "WorkoutPlanNotActiveError";
    }
}

// Esse erro é lançado quando tentamos iniciar uma sessão de treino, mas a sessão já foi iniciada
export class SessionAlreadyStartedError extends Error{
    constructor(message: string){
        super(message);
        this.name = "SessionAlreadyStartedError";
    }
}

// Na verdade a class error basicamente é ela que atua disparando mensagem de erros 
// quando nosso projeto não roda direito, o que a gente está fazendo é controlando onde 
// pode ocorrer erros e dando nome no nosso erros para facilitar depois na manutenção.