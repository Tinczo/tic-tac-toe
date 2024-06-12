package com.tictactoe.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.web.SecurityFilterChain;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.InstanceProfileCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.internal.crt.DefaultS3CrtAsyncClient;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Value("${aws_access_key_id}")
    private String aws_access_key_id;
    @Value("${aws_secret_access_key}")
    private String aws_secret_access_key;
    @Value("${aws_session_token}")
    private String aws_session_token;
    private final String issuerUri;

    @Autowired
    public SecurityConfiguration(@Value("${cognito.issuer-uri}") String issuerUri) {
//         this.issuerUri=issuerUri+"us-east-1_9qsn9367w";
        this.issuerUri=issuerUri+System.getenv("USER_POOL_ID"); //TODO: Done

    }

    @Bean
    public SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests((httpRequestsAuthorizer) ->
                        httpRequestsAuthorizer
                                .requestMatchers("game/*").authenticated()
                                .anyRequest().permitAll()
                )
                .oauth2ResourceServer(oAuth2ResourceServerConfigurerCustomizer())
                .build();
    }

    private Customizer<OAuth2ResourceServerConfigurer<HttpSecurity>> oAuth2ResourceServerConfigurerCustomizer(){
        final JwtDecoder decoder = JwtDecoders.fromIssuerLocation(issuerUri);
        return (resourceServerConfigurer) -> resourceServerConfigurer
                .jwt(jwtConfigurer -> jwtConfigurer.decoder(decoder));
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.US_EAST_1)
//                .credentialsProvider(StaticCredentialsProvider.create(AwsSessionCredentials.create(aws_access_key_id, aws_secret_access_key, aws_session_token))).build();
                .credentialsProvider(InstanceProfileCredentialsProvider.create()).build(); //TODO: Done
    }
}
