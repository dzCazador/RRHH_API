const express = require('express');
//const pdfkit = require('pdfkit');
const pdf = require('html-pdf');
const fs = require('fs');
const { sql, connectToDatabase } = require('./db/mssql');
const app = express();

connectToDatabase();
/*
app.get('/generate_pdf/:telefono', async (req, res) => {
    try {
        const { telefono } = req.params; 
        const request = new sql.Request();
        var codigoEmpleado = 0;
        var result = await request.query(`SELECT ternro FROM telefono T
                                          INNER JOIN cabdom CD ON CD.domnro = T.domnro
                                          WHERE telnro = '${telefono}'`);

        //console.log (result.recordset[0]);
        if (result.recordset.length > 0) { 
            codigoEmpleado = result.recordset[0].ternro;
        }                               
        else {
            res.status(404).send('No se encontró ningún registro para el teléfono proporcionado.');
        }    
        
        result = await request.query(`EXEC dbo.[botExportarUltimoRecibo] ${codigoEmpleado}`);

        const pdfPath = 'output.pdf';
        const pdfDoc = new pdfkit();
        pdfDoc.pipe(fs.createWriteStream(pdfPath));

        result.recordset.forEach(row => {
            pdfDoc.text(JSON.stringify(row),null,2);
            pdfDoc.moveDown();
            //pdfDoc.addPage();
        });

        pdfDoc.end();

        res.download(pdfPath);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});
*/



app.get('/generate_pdf/:telefono', async (req, res) => {
    try {
        const { telefono } = req.params;
        const request = new sql.Request();
        let codigoEmpleado = 0;
        let result = await request.query(`SELECT ternro FROM telefono T
                                          INNER JOIN cabdom CD ON CD.domnro = T.domnro
                                          WHERE telnro = '${telefono}'`);
        console.log(telefono)
        if (result.recordset.length > 0) { 
            codigoEmpleado = result.recordset[0].ternro;
        } else {
            return res.status(404).send('No se encontró ningún registro para el teléfono proporcionado.');
            console.error('No se encontró ningún registro para el teléfono proporcionado: '+telefono);
        }    
        if (codigoEmpleado!=0){
            result = await request.query(`EXEC dbo.[botExportarUltimoRecibo] ${codigoEmpleado}`);

            // Construir el contenido HTML para el PDF
            let htmlContent = `
            <html>
            <head>
                <title>Recibo</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    h1 {
                        text-align: center;
                    }
                    p {
                        margin-bottom: 10px;
                    }
                    ul {
                        margin-left: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Recibo</h1>
            `;

            // Agregar los datos del recibo al contenido HTML
            result.recordset.forEach(row => {
                htmlContent += `<p>${JSON.stringify(row, null, 2)}</p>`;
            });

            htmlContent += `
            </body>
            </html>
            `;

            // Configurar opciones de PDF
            const options = {
                format: 'Letter'
            };

            // Convertir HTML a PDF
            pdf.create(htmlContent, options).toStream(function(err, stream) {
                if (err) {
                    console.error('Error generating PDF:', err);
                    return res.status(500).send('Error generating PDF');
                } else {
                    // Establecer cabeceras de la respuesta
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename=output/ReciboHaberes.pdf`);
                    
                    // Enviar el archivo PDF
                    stream.pipe(res);
                }
            });
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
