export const dadosInicias = {

clientes:[
{
 id: "cli_1",
 nome:"Valda Maria",
 cpf: "123.456.789-00",
 regiao: "Nordeste"

},

{
    id: "cli_2",
    nome:"João da Silva",
    cpf: "987.654.321-00",
    regiao: "Sudeste"

},

{
    id: "cli_3",
    nome:"Maria Oliveira",
    cpf: "456.789.123-00",
    regiao: "Sul"




},

{
    id: "cli_4",    
    nome:"Carlos Souza",
    cpf: "321.654.987-00",
    regiao: "Centro-Oeste"
}

],

vendedores :[
    {
        id: "vend_1",
        nome:"TechBashia",
        cnpj: "12.345.678/0001-09",
        
    },
    {
        id: "vend_2",
        nome:"Livraria Sol",
        cnpj: "98.765.432/0001-01",
    },
    {
        id: "vend_3",
        nome:"EletroMundo",
        cnpj: "45.678.901/0001-23", 
    }
],

produtos : [

    {
        id: "prod_1",
        nome: "Mouse Gamer",
        preco: 120.00,
        categoria: "Eletrônicos",
        vendedorId:"vend_1", //vendedores.techbahia
        qtdEstoque: 18        
    },


    {
        id: "prod_2",
        nome: "livro",
        preco: 80.00,
        categoria: "livros",
        vendedorId:"vend_2", //vendedores.Livraria Sol
        qtdEstoque:  3      
    },



    {
        id: "prod_3",
        nome: "Smart TV",
        preco: 2500.00,
        categoria: "Eletrônicos",
        vendedorId:"vend_3", //vendedores.EletroMundo
        qtdEstoque:  5



    },
    {
        id: "prod_4",
        nome: "Notebook",
        preco: 3500.00,
        categoria: "Eletrônicos",
        vendedorId:"vend_1", //vendedores.TechBashia
        qtdEstoque:  10
    },

    {
        id: "prod_5",
        nome: "Carderno Inteligente",
        preco: 50.00,
        categoria: "Papelaria",
        vendedorId:"vend_2", //vendedores.Livraria Sol
        qtdEstoque:  20
    },



    {
        id: "prod_6",
        nome : "Fone de Ouvido",
        preco: 150.00,
        categoria: "Eletrônicos",
        vendedorId:"vend_3", //vendedores.EletroMundo
        qtdEstoque:  15
    },


    {
        id: "prod_7",
        nome: "Mochila Gamer",
        preco: 900.00,
        categoria: "Vestuário",
        vendedorId:"vend_1", //vendedores.TechBashia
        qtdEstoque:  25

    }



],

cupons:[
    {
        codigo: "BEMVINDO10",
        tipo: "percentual",
        desconto: 10,
        validade: "2027-01-17"
    },

    {
        codigo: "PDA15",
        tipo: "fixo",
        desconto: 15,
        validade: "2027-02-07"
    },
    {
        codigo: "FRETEGRATIS",
        tipo: "frete",
        desconto: 100,
        validade: "2027-03-15"
    }
]
};

