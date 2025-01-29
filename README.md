Informacion para crear el paquete de instalacion compatible con windows 7 32bits:

tsconfig.json -> el archivo de entrada se tiene que transpilar en commonjs y el resto del proyecto se tiene que transpilar en ESNext
package.json -> el proyecto tiene que estar configurado en commonjs ("type": "commonjs") y tiene que tener el script "build": "electron-builder"
y luego se empaqueta la aplicacion "npm run build -- --win --ia32"
- El comando tsc esta configurado para que al ejecutarse ignorar el archivo de entrada al proyecto ("src/public/index.ts") ya que este se tiene que transpilar de forma diferente al resto, como se aclara anteriormente