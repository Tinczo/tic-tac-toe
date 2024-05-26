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

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    private final String issuerUri;

    @Autowired
    public SecurityConfiguration(@Value("${cognito.issuer-uri}") String issuerUri) {
        // this.issuerUri=issuerUri+"us-east-1_Bc3O21DMG";
        this.issuerUri=issuerUri+System.getenv("USER_POOL_ID");
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
}
