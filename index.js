const inquirer = require("inquirer")
const chalk = require("chalk")

const fs = require("fs")

operation()

function operation(){
    inquirer.prompt([{
        type: 'list',
        name:'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    },
]).then((aswer)=>{
    const action = aswer['action']

    if(action === 'Criar conta'){
        createAccount()
    }
    else if(action === 'Depositar'){
        deposit()

    }
    else if(action === 'Consultar saldo'){
        getAccountBalance()
    }
    else if(action === 'Sacar'){
        widthDraw()
    }
    else if(action === 'Sair'){
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts"))
        process.exit()
    }
}).catch((err) => console.log(err))
}

//create account

function createAccount(){
    console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco"));
    console.log(chalk.green('Defina as opções de conta a seguir'));

    buildAccount()
}

function buildAccount(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para a sua conta:'
    }]).then((answer) =>{
        const accountName = answer['accountName']
        console.info(accountName)
        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err){
            console.log(err)
        })
        console.log(chalk.green("Parabéns sua conta foi criada"))
        operation();
    }).catch(err => console.log())
}

//add an amount to user account

function deposit(){
    inquirer.prompt([{
        name: 'accountName',
        message:'Qual é o nome da sua conta?'
    }]).then((answer) =>{
        const accountName = answer['accountName']
       if(!checkAccount(accountName)){
        return deposit()
       }

       inquirer.prompt([{
        name: 'amount',
        message: 'Quanto você deseja depositar'
       }]).then((answer) =>{
        const amount = answer['amount']
        addAmount(accountName, amount)
        operation()
       }).catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outra'))
        return false
    }
    return true
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)
    // console.log(accountData)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente mais tarde!"));
        return deposit()
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
            function(err){
                console.log(err)
            },
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`))
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        ecoding: "utf8",
        flag: "r"
    })
    return JSON.parse(accountJSON)
}

function getAccountBalance(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }]).then((answer) =>{
        const accountName = answer["accountName"]

        if(!checkAccount(accountName)){
            return getAccountBalance()
        }
        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
        operation()
    }).catch(err => console.log(err))
}

function widthDraw(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }]).then((answer) => {
        const accountName = answer['accountName']
        if(!checkAccount(accountName)){
            return widthDraw();
        }
        inquirer.prompt([{
            name: "amount",
            message: "Quanto você deseja sacar?"
        }]).then((answer) =>{
            const amount = answer['amount']
            removeAccount(accountName,amount)
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

function removeAccount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde"))
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponivel'))
        return widthDraw();
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta`))
    operation()
}