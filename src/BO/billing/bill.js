class bill{
    createBill = async () =>{}

    //<--- Se llama cada vez que se hace un pago, ve si ya toda la factura esta pagada para cambiar el estatus
    #verifyPayBill = ({ idBill }) => { }


    /*Hay que especificar 
    * @Metodo de pago
    * Monto
    * Id de la factura
    * Id del usuario
    */
    payBill = async () => { }

    #payBank = async () => { }

    #payOther = async () => { }

    calculateTotal = async ({ idBill }) => { }

    #changeStatusBill = ({ idBill, status }) => { }

    deleteBill = async () =>{}

    seeProductsBill = () => { }

    seeBillsBy = async () =>{}

    addRowBill = async () => { }

    deleteRowBill = async () => { }

}

export default bill