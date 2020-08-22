'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');  //filesystem
var path = require('path'); 

var controller = {

    datosCurso: (req,resp) =>{
        var hola = req.body.hola;

        return resp.status(200).send({
            curso:'Master Frameworks JS',
            autor:'Victor Robles',
            url:'http://victorroblesweb.es',
            hola
          })
    },
    test: (req,resp)=>{
        return resp.status(200).send({
            message:'accion test de mi controlador articulos'
        })
    },
    save: (req,resp)=>{
        //recoger parametros por post
        var params = req.body;

        //validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content); //buscar google validator node

        }catch(err)
        {
            return resp.status(200).send({
                status:'error',
                message:'Faltan datos por enviar !!'
            })
        }
        
        if(validate_title && validate_content)
        {
            //crear el objeto a guardar
            var article = new Article();

            //asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            //guardar objeto en BD
            article.save((err, articleStored)=> {
                if(err || !articleStored){
                    return resp.status(404).send({
                        status: 'error',
                        message:'El articulo no se ha guardado !!!'
                    })
                }

                 //devolver respuesta
                return resp.status(200).send({
                    status: 'success',
                    articleStored
                })
            })

        }
        else{
            return resp.status(200).send({
                status:'error',
                message:'Los datos no son validos !!!'
            })
        }

        
    },

    getArticles: (req, resp) => {
        var query = Article.find({});

        var last = req.params.last;     
        if(last || last != undefined) {
            query.limit(5);
        }

        //find and sort by date desc
        query.sort('-date').exec((err,articles) => {
            if(err){
                return resp.status(500).send({
                    status:'error',
                    message:'Error al devolver los articulos !!'
                })
            }

            if(!articles){
                return resp.status(404).send({
                    status:'error',
                    message:'No hay articulos para mostrar !!'
                })
            }

            return resp.status(200).send({
                status:'success',
                articles
            })
        })
        
    },
    getArticle: (req, resp) => {

        //recoger id de la url
        var articleid = req.params.id;

        //comprobar que existe
        if(!articleid || articleid == null)
        {
            return resp.status(404).send({
                status:'error',
                message:'No se envio id!!'
            })
        }

        //buscar articulo
        Article.findById(articleid, (err,  article) => {
            if(err || !article){
                return resp.status(500).send({
                    status:'error',
                    message:'No existe articulo !!'
                }) 
            }

            //devolver en json
                return resp.status(200).send({
                    status:'success',
                    article
                })
        })
        
        
    },
    update:(req,resp) => {
        //obtener id desde url
        var articleId = req.params.id;

        //obtener datos que llegan por body
        var params = req.body;

        //validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }
        catch(err){
            return resp.status(404).send({
                status:'error',
                message:'Faltan datos por enviar !!'
            }) 
        }

        if(validate_title && validate_content)
        {
            //find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated)=>{
                if(err)
                {
                    return resp.status(500).send({
                        status:'error',
                        message:'Error al actualizar !!!'
                    }); 
                }

                if(!articleUpdated){
                    return resp.status(404).send({
                        status:'error',
                        message:'No existe el articulo !!!'
                    });
                }

                return resp.status(200).send({
                    status:'success',
                    articleUpdated
                });
            });
        }
        else{
            //devolver mensaje error validacion
            return resp.status(200).send({
                status:'error',
                message:'La validacion no es correcta !!'
            }) 
        }   
    },
    delete:(req,resp)=>{
        //obtener id desde url
        var articleId = req.params.id;

        //Find and Delete
        Article.findOneAndDelete({_id:articleId}, (err,articleRemoved)=>{
            if(err)
            {
                return resp.status(500).send({
                    status:'error',
                    message:'Error al borrar !!!'
                }); 
            }

            if(!articleRemoved) //articulo no se encuentra para borrar
            {
                return resp.status(404).send({
                    status:'error',
                    message:'No se ha borrado articulo, posiblemente no existe !!!'
                }); 
            }

            return resp.status(200).send({
                status:'success',
                article:articleRemoved
            }) 
        })
    },
    upload: (req,resp) => {
        //configurar modulo connect multiparty routes/article.js

        //recoger el fichero de la peticion
        var filename = 'Imagen no subida...'

        if(!req.files){
            return resp.status(404).send({
                status:'error',
                message:filename
            });  
        }

        //conseguir nombre y extensión del archivo
        var filepath = req.files.file0.path; //'file0' seria el fieldname desde donde envia el archivo
        var file_split = filepath.split('\\');  //"path": "upload\\articles\\mIlY0_KgczUev0qsTCHIbbPS.png"

        /* ADVERTENCIA LINUX O MAC */
        //var file_split = filepath.split('/'); 

        //nombre del archivo en servidor
        var file_name = file_split[2];

        //extension del archivo
        var extension_split = file_name.split('.');
        var file_ext = extension_split[1];

        //comprobar la extensión (solo imagenes), si no es valida borrar fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif')
        {
           //borrar archivo subido
            fs.unlink(filepath, (err)=> {
                return resp.status(200).send({
                    status:'error',
                    message:'La extension del archivo no es valida'
                }); 
            })
        }
        else{
         //si todo es valido, sacar id de url
         var articleId = req.params.id;

         //buscar articulo, asignarle nombre imagen y actualizar
         Article.findOneAndUpdate({_id:articleId }, {
             image: file_name
         }, {new:true}, (err,articleUpdated) => {

            if(err || !articleUpdated){
                return resp.status(200).send({
                    status:'error',
                    message:'Error al guardar la imagen del articulo'
                  });
            }

            return resp.status(200).send({
                status:'success',
                articleUpdated
              });
         })

        
        }
        
    }, //end upload file
    
    getImage: (req,resp) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return resp.sendFile(path.resolve(path_file))

            }
            else{
                return resp.status(404).send({
                    status:'error',
                    message: 'La imagen no existe !!!'
                  });
            }
        })

       
    },//end get image file

    search:(req,resp) => {
        //sacar string a buscar
        var searchString = req.params.search;

        //Find OR
        Article.find({ "$or": [
            {"title": {"$regex": searchString, "$options": "i"}},
            {"content": {"$regex": searchString, "$options": "i"}},
        ]
        })
        .sort([['date','descending']])
        .exec((err,articles) => {
            if(err)
            {
                return resp.status(500).send({
                    status:'error',
                    message:'Error en la peticion !!!'
                  });
            }

            if(!articles || articles.length == 0){
                return resp.status(404).send({
                    status:'error',
                    message:'No hay articulos que coincidan con tu busqueda !!!'
                  });
            }

            return resp.status(200).send({
                status:'success',
                articles
              });
        })
    }//end search
};

module.exports = controller;