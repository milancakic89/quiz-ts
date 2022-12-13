
const categories = [
    'GEOGRAFIJA',
    'ISTORIJA',
    'MUZIKA',
    'FILMOVI I SERIJE',
    'POZNATE LICNOSTI',
    'SPORT',
    'RAZNO'
]

export const isValidStringInput = (str: string) => {
    let type = typeof str;
    if(type !== 'string'){
        return false;
    }
    if(str.length < 5){
        return false;
    }
}


export const isValidCategory = (req: any, res: any, next: any) => {
    if (!categories.includes(req.body.category)){
        res.send({
            success: false,
            data: undefined,
            message: 'Kategorija nije pronadjena'
        })
    }
    next()
}



