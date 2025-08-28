package stage.livraison.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import stage.livraison.entities.User;
import stage.livraison.repositories.UserRepository;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = Optional.ofNullable(userRepository.findByUsername(username));
        User user = userOpt.orElseThrow(() -> {
            System.err.println("❌ User not found: " + username);
            return new UsernameNotFoundException("User not found with username: " + username);
        });
        System.out.println("✅ Loaded user: " + user.getUsername() + ", Role: " + user.getRole().name());
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())));
    }
}