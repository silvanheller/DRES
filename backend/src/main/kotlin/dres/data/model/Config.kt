package dres.data.model


import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File

data class Config(
        val httpPort: Int = 8080,
        val httpsPort: Int = 8443,
        val keystorePath: String = "keystore.jks",
        val keystorePassword: String = "password",
        val dataPath: String = "./data",
        val cachePath: String = "./cache") {

    companion object{
        fun read(file: File): Config? {
            val mapper = ObjectMapper()
            return try {
                mapper.readValue(file, Config::class.java)
            } catch (e: Exception) {
                null
            }
        }
    }
}