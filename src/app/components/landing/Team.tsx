import { motion } from "framer-motion";
import { User } from "lucide-react";

interface Props {
  barbers: any[];
}

const Team = ({ barbers }: Props) => {
  return (
    <section id="equipo" className="py-24 md:py-32 px-6 bg-secondary">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Profesionales
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold">
            Nuestro Equipo
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              <div className="w-48 h-48 mx-auto mb-6 bg-muted flex items-center justify-center">
                {barber.photo_url ? (
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>

              <h3 className="text-2xl font-semibold">
                {barber.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {barber.role}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Team;
